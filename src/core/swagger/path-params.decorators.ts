import { ApiParam } from '@nestjs/swagger';

/** Use on the controller class when every route includes `churches/:churchId/...`. */
export function ApiChurchIdParam() {
  return ApiParam({
    name: 'churchId',
    schema: { type: 'string', format: 'uuid' },
    description: 'Church ID',
  });
}

/** Use on the controller class when every route includes `.../branches/:branchId/...`. */
export function ApiBranchIdParam() {
  return ApiParam({
    name: 'branchId',
    schema: { type: 'string', format: 'uuid' },
    description: 'Branch ID',
  });
}

export function ApiUuidPathParam(name: string, description: string) {
  return ApiParam({
    name,
    schema: { type: 'string', format: 'uuid' },
    description,
  });
}
