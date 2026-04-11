export enum Role {
  CHURCH_ADMIN = 'church_admin',
  CHURCH_MEMBER = 'church_member',
  BRANCH_ADMIN = 'branch_admin',
  BRANCH_MANAGER = 'branch_manager',
  BRANCH_MEMBER = 'branch_member',
}

export const BRANCH_SPECIFIC_ROLES = [
  Role.BRANCH_ADMIN,
  Role.BRANCH_MANAGER,
  Role.BRANCH_MEMBER,
];

export const CHURCH_WIDE_ROLES = [Role.CHURCH_ADMIN, Role.CHURCH_MEMBER];
