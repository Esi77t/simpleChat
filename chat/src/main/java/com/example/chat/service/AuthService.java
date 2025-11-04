package com.example.chat.service;

import com.example.chat.dto.LoginRequest;
import com.example.chat.dto.LoginResponse;
import com.example.chat.dto.SignUpRequest;
import com.example.chat.exception.UserAlreadyExistsException;
import com.example.chat.model.ChatAccount;
import com.example.chat.repository.ChatAccountRepository;
import com.example.chat.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ChatAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    // 회원가입
    @Transactional
    public ChatAccount signUp(SignUpRequest request) {
        // 유효성 검사
        if(accountRepository.existsByUserId(request.userId())) {
            throw new UserAlreadyExistsException("User ID already exists : " + request.userId());
        }
        if(accountRepository.existsByNickname(request.nickname())) {
            throw new UserAlreadyExistsException("Nickname already exists : " + request.nickname());
        }

        ChatAccount account = ChatAccount.builder()
                .userId(request.userId())
                .nickname(request.nickname())
                .password(request.password())
                .build();

        return accountRepository.save(account);
    }

    // 로그인
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 스프링 시큐리티를 통한 인증시도
        // CustomUserDetailsService에서 로드한 UserDetails하고 비교
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.userId(),
                        request.password()
                )
        );

        // 인증이 성공하면 SecurityContext에 Authentication 객체를 생성
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // JWT 토큰 생성
        String jwt = tokenProvider.generateToken(authentication);

        // ChatAccount 정보 조회
        ChatAccount account = accountRepository.findByUserId(request.userId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB."));

        return LoginResponse.builder()
                .accountId(account.getAccountId())
                .userId(account.getUserId())
                .nickname(account.getNickname())
                .token(jwt)
                .build();
    }
}
