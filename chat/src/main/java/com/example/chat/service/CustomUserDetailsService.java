package com.example.chat.service;

import com.example.chat.model.ChatAccount;
import com.example.chat.repository.ChatAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

// 스프링 시큐리티가 사용자 정보를 DB에서 로드하는 방법을 정의하는 서비스
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final ChatAccountRepository chatAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {

        ChatAccount account = chatAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with userId : " + userId));

        return new User(account.getUserId(), account.getPassword(), new ArrayList<>());
    }
}
