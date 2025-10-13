package com.enseniamelo.usuarios.util.http;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.server.ServerWebInputException;

import com.enseniamelo.usuarios.util.exception.BadRequestException;
import com.enseniamelo.usuarios.util.exception.InvalidInputException;
import com.enseniamelo.usuarios.util.exception.NotFoundException;

@RestControllerAdvice
class GlobalControllerExceptionHandler {

	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

	@ResponseStatus(BAD_REQUEST)
	@ExceptionHandler(ServerWebInputException.class)
	public @ResponseBody HttpErrorInfo handleServerWebInputException(ServerHttpRequest request, ServerWebInputException ex) {
    	LOGGER.error("Manejando ServerWebInputException");
    	String message = "Type mismatch";
    	return new HttpErrorInfo(BAD_REQUEST, request.getPath().pathWithinApplication().value(), message);
	}

	@ResponseStatus(BAD_REQUEST)
	@ExceptionHandler(BadRequestException.class)
	public @ResponseBody HttpErrorInfo handleBadRequestExceptions(ServerHttpRequest request, BadRequestException ex) {
		LOGGER.error("Manejando BadRequestException");
		return createHttpErrorInfo(BAD_REQUEST, request, ex);
	}

	@ResponseStatus(NOT_FOUND)
	@ExceptionHandler(NotFoundException.class)
	public @ResponseBody HttpErrorInfo handleNotFoundExceptions(ServerHttpRequest request, NotFoundException ex) {
		LOGGER.error("Manejando NotFoundException");
		return createHttpErrorInfo(NOT_FOUND, request, ex);
	}

	@ResponseStatus(UNPROCESSABLE_ENTITY)
	@ExceptionHandler(InvalidInputException.class)
	public @ResponseBody HttpErrorInfo handleInvalidInputException(ServerHttpRequest request,
			InvalidInputException ex) {
		LOGGER.error("Manejando InvalidInputException");
		return createHttpErrorInfo(UNPROCESSABLE_ENTITY, request, ex);
	}

	@ExceptionHandler({org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
                   jakarta.validation.ConstraintViolationException.class})
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public @ResponseBody HttpErrorInfo handleInvalidPathVariable(ServerHttpRequest request, Exception ex) {
		return createHttpErrorInfo(HttpStatus.BAD_REQUEST, request, ex);
	}

	@ExceptionHandler(org.springframework.web.method.annotation.HandlerMethodValidationException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public @ResponseBody HttpErrorInfo handlePathVariableValidation(ServerHttpRequest request,
																HandlerMethodValidationException ex) {
		// Concatenamos todos los mensajes
		String message = ex.getAllErrors().stream()
						.map(MessageSourceResolvable::getDefaultMessage)
						.reduce((m1, m2) -> m1 + "; " + m2)
						.orElse(ex.getMessage());

		return new HttpErrorInfo(HttpStatus.BAD_REQUEST,
								request.getPath().pathWithinApplication().value(),
								message);
	}
		
	private HttpErrorInfo createHttpErrorInfo(HttpStatus httpStatus, ServerHttpRequest request, Exception ex) {

		final String path = request.getPath().pathWithinApplication().value();
		final String message = ex.getMessage();

		LOGGER.debug("Returning HTTP status: {} for path: {}, message: {}", httpStatus, path, message);
		return new HttpErrorInfo(httpStatus, path, message);
	}

}