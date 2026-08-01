from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSupportOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.role in {"support", "admin"})


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.role == "admin")


class IsApprovedArtist(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user.is_authenticated
            and request.user.role == "artist"
            and request.user.artist_status == "approved"
        )


class IsOwnerOrReadOnly(BasePermission):
    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user or request.user.role == "admin"
