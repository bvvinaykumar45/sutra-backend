export const ProjectMemberRoleEnum = {
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

export const AvailableProjectMemberRoles = Object.values(ProjectMemberRoleEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);

export const TaskUsersEnum = {
  CREATED_BY: "createdBy",
  ASSIGNED_BY: "assignedBy",
  ASSIGNED_TO: "assignedTo",
};
