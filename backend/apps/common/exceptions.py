from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response
    detail = response.data
    if isinstance(detail, dict) and set(detail) == {"detail"}:
        message = str(detail["detail"])
    else:
        message = "درخواست نامعتبر است."
    response.data = {"success": False, "message": message, "errors": detail}
    return response
