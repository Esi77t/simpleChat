package com.example.chat.dto;

import com.example.chat.model.RoomType;

import java.util.List;

public record ChatRoomCreateRequest(
        String roomName,
        String ownerId,
        List<String> participantIds,
        RoomType type
) { }
