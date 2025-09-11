package com.enseniamelo.commentsservice.service;

import com.enseniamelo.commentsservice.dto.CommentDTO;
import com.enseniamelo.commentsservice.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InMemoryCommentService implements CommentService {

    private final Map<Long, CommentDTO> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    @Override
    public Flux<CommentDTO> findAll(Long courseId, Long tutorId) {
        return Flux.fromIterable(store.values())
                .filter(c -> (courseId == null || courseId.equals(c.getCourseId())) &&
                             (tutorId == null || tutorId.equals(c.getTutorId())));
    }

    @Override
    public Mono<CommentDTO> findById(Long id) {
        CommentDTO comment = store.get(id);
        if (comment == null) {
            return Mono.error(new ResourceNotFoundException("Comment", id));
        }
        return Mono.just(comment);
    }

    @Override
    public Mono<CommentDTO> create(CommentDTO dto) {
        // 🔹 Validación: userId obligatorio
        if (dto.getUserId() == null) {
            return Mono.error(new IllegalArgumentException("El userId es obligatorio"));
        }
        // 🔹 Validación: debe existir al menos courseId o tutorId
        if (dto.getCourseId() == null && dto.getTutorId() == null) {
            return Mono.error(new IllegalArgumentException("Debe especificar courseId o tutorId"));
        }

        Long id = idGenerator.getAndIncrement();
        CommentDTO newComment = CommentDTO.builder()
                .id(id)
                .userId(dto.getUserId())
                .courseId(dto.getCourseId())
                .tutorId(dto.getTutorId())
                .comentario(dto.getComentario())
                .calificacion(dto.getCalificacion())
                .creadoEn(LocalDateTime.now())
                .build();

        store.put(id, newComment);
        return Mono.just(newComment);
    }

    @Override
    public Mono<CommentDTO> update(Long id, CommentDTO dto) {
        CommentDTO existing = store.get(id);
        if (existing == null) {
            return Mono.error(new ResourceNotFoundException("Comment", id));
        }

        // Validación igual que en create
        if (dto.getUserId() == null) {
            return Mono.error(new IllegalArgumentException("El userId es obligatorio"));
        }
        if (dto.getCourseId() == null && dto.getTutorId() == null) {
            return Mono.error(new IllegalArgumentException("Debe especificar courseId o tutorId"));
        }

        existing.setUserId(dto.getUserId());
        existing.setCourseId(dto.getCourseId());
        existing.setTutorId(dto.getTutorId());
        existing.setComentario(dto.getComentario());
        existing.setCalificacion(dto.getCalificacion());
        // creadoEn no se actualiza, mantiene la fecha original

        store.put(id, existing);
        return Mono.just(existing);
    }

    @Override
    public Mono<Void> delete(Long id) {
        if (!store.containsKey(id)) {
            return Mono.error(new ResourceNotFoundException("Comment", id));
        }
        store.remove(id);
        return Mono.empty();
    }
}
