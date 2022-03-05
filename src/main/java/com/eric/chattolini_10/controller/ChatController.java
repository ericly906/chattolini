package com.eric.chattolini_10.controller;

import com.eric.chattolini_10.model.ChatMessage;
import com.eric.chattolini_10.model.User;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
@RequestMapping("/api/chat")
public class ChatController {
    @MessageMapping("/chat.register")
    @SendTo("/topic/public")
    public ChatMessage register(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    /**
    @MessageMapping("/chat.send")
    @SendTo("/topic/{user}")
    public ChatMessage reply(@Payload ChatMessage chatMessage, @PathVariable String user) {
        chatMessage.setContent("private message to " + user + ": " + chatMessage.getContent());
        return chatMessage;
    }
    **/
}
