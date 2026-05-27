from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS
)


class RoleBasedPermission(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        if not user.is_authenticated:
            return False

        if not hasattr(user, "profile"):
            return False

        role = (
            user.profile.role
            .strip()
            .lower()
        )

        # ADMIN → full access
        if role == "admin":
            return True

        # AUDITOR → GET only
        if role == "auditor":
            return (
                request.method
                in SAFE_METHODS
            )

        # ANALYST
        if role == "analyst":

            # Analysts cannot ingest
            if (
                request.method not in SAFE_METHODS
                and
                "ingestionjob"
                in view.__class__.__name__.lower()
            ):
                return False

            return True

        return False