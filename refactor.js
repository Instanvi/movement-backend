const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const domainDir = path.join(srcDir, 'domain');
const modulesDir = path.join(srcDir, 'modules');

// Create modules directory
if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir, { recursive: true });

const features = ['church', 'branch', 'member', 'donation', 'fundraiser', 'notification', 'report', 'onboarding'];

for (const feature of features) {
  const featureDir = path.join(modulesDir, feature);
  const dtoDir = path.join(featureDir, 'dto');
  if (!fs.existsSync(featureDir)) fs.mkdirSync(featureDir, { recursive: true });
  if (!fs.existsSync(dtoDir)) fs.mkdirSync(dtoDir, { recursive: true });

  // Move controller
  const oldCtrl = path.join(domainDir, `${feature}.controller.ts`);
  const newCtrl = path.join(featureDir, `${feature}.controller.ts`);
  if (fs.existsSync(oldCtrl)) {
    let content = fs.readFileSync(oldCtrl, 'utf8');
    // Fix service imports
    content = content.replace(/'\.\/services\//g, `'../`);
    content = content.replace(/'\.\/dto\//g, `'./dto/`);
    // Fix any other relative imports here
    fs.writeFileSync(newCtrl, content);
    fs.unlinkSync(oldCtrl);
  }

  // Move service
  const oldSvc = path.join(domainDir, 'services', `${feature}.service.ts`);
  const newSvc = path.join(featureDir, `${feature}.service.ts`);
  if (fs.existsSync(oldSvc)) {
    let content = fs.readFileSync(oldSvc, 'utf8');
    content = content.replace(/'\.\.\/repositories\//g, `'../../domain/repositories/`);
    content = content.replace(/'\.\.\/dto\//g, `'./dto/`);
    content = content.replace(/'\.\.\/\.\.\/core\//g, `'../../core/`);
    fs.writeFileSync(newSvc, content);
    fs.unlinkSync(oldSvc);
  }

  // Move existing DTOs if they exist perfectly matches
  const oldDto = path.join(domainDir, 'dto', `${feature}.dto.ts`);
  const newDto = path.join(dtoDir, `${feature}.dto.ts`);
  if (fs.existsSync(oldDto)) {
    fs.copyFileSync(oldDto, newDto);
    fs.unlinkSync(oldDto);
  }

  // Generate a Module file
  const moduleContent = `import { Module } from '@nestjs/common';\n` +
    (fs.existsSync(newCtrl) ? `import { ${capitalize(feature)}Controller } from './${feature}.controller';\n` : '') +
    (fs.existsSync(newSvc) ? `import { ${capitalize(feature)}Service } from './${feature}.service';\n` : '') +
    `\n@Module({\n` +
    `  controllers: [${fs.existsSync(newCtrl) ? capitalize(feature) + 'Controller' : ''}],\n` +
    `  providers: [${fs.existsSync(newSvc) ? capitalize(feature) + 'Service' : ''}],\n` +
    `  exports: [${fs.existsSync(newSvc) ? capitalize(feature) + 'Service' : ''}]\n` +
    `})\nexport class ${capitalize(feature)}Module {}\n`;

  fs.writeFileSync(path.join(featureDir, `${feature}.module.ts`), moduleContent);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Ensure app.module.ts is updated
const appModulePath = path.join(srcDir, 'app.module.ts');
if (fs.existsSync(appModulePath)) {
  let appModule = fs.readFileSync(appModulePath, 'utf8');
  // Add imports
  for (const feature of features) {
    if (!appModule.includes(`${capitalize(feature)}Module`)) {
      appModule = `import { ${capitalize(feature)}Module } from './modules/${feature}/${feature}.module';\n` + appModule;
      // Add to imports array
      appModule = appModule.replace(/imports: \[\n/g, `imports: [\n    ${capitalize(feature)}Module,\n`);
    }
  }
  fs.writeFileSync(appModulePath, appModule);
}

console.log('Restructured successfully into src/modules/');
