package com.enseniamelo.usuarios.util.events;

import java.time.ZonedDateTime;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.ZonedDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event<K, T> {

    public enum Type {
        CREATE,           
        DELETE,          
        UPDATE,         
        VERIFY_REQUEST,   
        APPROVE_REQUEST,  
        REJECT_REQUEST    
    }

    private Type eventType;
    private K key;
    private T data;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    private ZonedDateTime eventCreatedAt;

    public Event(Type eventType, K key, T data) {
        this.eventType = eventType;
        this.key = key;
        this.data = data;
        this.eventCreatedAt = ZonedDateTime.now();
    }
}