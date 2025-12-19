package com.web.chatbackend.controller;

import com.web.chatbackend.model.User;
import com.web.chatbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    // 내 정보를 조회
    @GetMapping("/me")
    public ResponseEntity<User> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByUserId(userDetails.getUsername()));
    }

    // 회원탈퇴를 진행
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUserId(userDetails.getUsername());

        userService.deleteUser(user.getId());

        return ResponseEntity.noContent().build();
    }
}
