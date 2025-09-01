package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.dto.CommentDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CommentService {
    Flux<CommentDTO> findAll(Long courseId, Long tutorId);
    Mono<CommentDTO> findById(Long id);
    Mono<CommentDTO> create(CommentDTO dto);
    Mono<CommentDTO> update(Long id, CommentDTO dto);
    Mono<Void> delete(Long id);
}
