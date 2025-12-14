package com.enseniamelo.commentsservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.enseniamelo.commentsservice.external.MsUsuariosIntegration;
import com.enseniamelo.commentsservice.repository.ComentarioCursoRepository;

import reactor.core.publisher.Mono;

@Service("comentarioSecurityService")
public class ComentarioSecurityService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(ComentarioSecurityService.class);
    
    private final ComentarioCursoRepository repository;
    private final MsUsuariosIntegration usuariosIntegration;
    
    public ComentarioSecurityService(
            ComentarioCursoRepository repository,
            MsUsuariosIntegration usuariosIntegration) {
        this.repository = repository;
        this.usuariosIntegration = usuariosIntegration;
    }
    
    public Mono<Boolean> esComentarioDelUsuario(String idComentario) {
        LOGGER.debug("Verificando si el comentario {} pertenece al usuario autenticado", idComentario);
        
        return ReactiveSecurityContextHolder.getContext()
                .map(context -> context.getAuthentication())
                .flatMap(authentication -> {
                    Jwt jwt = (Jwt) authentication.getPrincipal();
                    String token = jwt.getTokenValue();
                    
                    return usuariosIntegration.obtenerUsuarioActual(token)
                            .flatMap(usuario -> {
                                return repository.findById(idComentario)
                                        .map(comentario -> {
                                            boolean esDelUsuario = comentario.getId_usuario().equals(usuario.getId());
                                            LOGGER.info("Comentario {} - Usuario actual: {} - Es del usuario: {}", 
                                                    idComentario, usuario.getId(), esDelUsuario);
                                            return esDelUsuario;
                                        })
                                        .defaultIfEmpty(false);
                            });
                })
                .defaultIfEmpty(false);
    }
}