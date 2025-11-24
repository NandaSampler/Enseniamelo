class AppError(Exception):
    code: str = "app_error"
    status_code: int = 400
    def __init__(self, message: str, *, extra=None):
        super().__init__(message)
        self.message = message
        self.extra = extra

class NotFoundError(AppError):
    code = "not_found"
    status_code = 404
    #NotFoundError("Plan no encontrado")

class ConflictError(AppError):
    code = "conflict"
    status_code = 409
    #ConflictError("Plan en uso", extra={"plan_id": "1"})