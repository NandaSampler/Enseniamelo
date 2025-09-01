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
    private final AtomicLong idGen = new AtomicLong(0L);

    @Override
    public Flux<CommentDTO> findAll(Long courseId, Long tutorId) {
        return Flux.fromIterable(store.values())
                .filter(dto -> {
                    if (courseId != null) return courseId.equals(dto.getCourseId());
                    if (tutorId != null) return tutorId.equals(dto.getTutorId());
                    return true;
                });
    }

    @Override
    public Mono<CommentDTO> findById(Long id) {
        CommentDTO dto = store.get(id);
        return dto != null ? Mono.just(dto) : Mono.empty();
    }

    @Override
    public Mono<CommentDTO> create(CommentDTO dto) {
        long id = idGen.incrementAndGet();
        dto.setId(id);
        dto.setCreadoEn(LocalDateTime.now());
        store.put(id, dto);
        return Mono.just(dto);
    }

    @Override
    public Mono<CommentDTO> update(Long id, CommentDTO dto) {
        CommentDTO existing = store.get(id);
        if (existing == null) {
            return Mono.error(new ResourceNotFoundException("Comment", id));
        }
        // Simple full replace while preserving id and creadoEn if absent
        dto.setId(id);
        if (dto.getCreadoEn() == null) dto.setCreadoEn(existing.getCreadoEn());
        store.put(id, dto);
        return Mono.just(dto);
    }

    @Override
    public Mono<Void> delete(Long id) {
        CommentDTO removed = store.remove(id);
        if (removed == null) {
            return Mono.error(new ResourceNotFoundException("Comment", id));
        }
        return Mono.empty();
    }
}
