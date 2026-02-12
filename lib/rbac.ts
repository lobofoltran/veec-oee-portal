export function hasRole(
    roles: string[],
    required: string[],
) {
    return required.some((r) =>
        roles.includes(r),
    );
}
