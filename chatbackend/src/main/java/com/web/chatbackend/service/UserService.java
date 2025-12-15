package com.web.chatbackend.service;

import com.web.chatbackend.dto.UserRegisterRequest;
import com.web.chatbackend.model.User;
import com.web.chatbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * 사용자 등록, 조회, 인증 관련 비즈니스 로직을 담당
 * UserDetailsService를 구현하여 Spring Security 인증 로직과 통합
 * */
@Service
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 생성자 주입
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 회원가입 로직 : 사용자 ID 중복 확인하고 비밀번호를 해시하여 저장
     * @param request 회원가입 요청 DTO
     * @return 저장된 User 엔티티
     */
    public User registerUser(UserRegisterRequest request) {
        // ID 중복검사
        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 사용자 ID입니다 : " + request.getUserId());
        }

        // 비밀번호 암호화(해시)
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // User 엔티티 생성
        User newUser = User.builder()
                .userId(request.getUserId())
                .password(hashedPassword)   // 해시된 비밀번호로 저장
                .nickname(request.getNickname())
                .build();

        return userRepository.save(newUser);
    }

    // 사용자 ID로 사용자 엔티티를 조회 (DTO 변환, 닉네임 조회 등에 사용)
    public User getUserByUserId(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 ID를 찾을 수 없습니다 : " + userId));

    }
    
    /**
     * Spring Security를 위한 사용자 로드 (UserDetailsService 구현
     * JWT 토큰 검증 후 Security Context에 사용자 정보를 저장할 때 사용
     * @param username JWT에서 추출한 userId (여기서는 login ID)
     * @return Spring Security의 UserDetails의 객체
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 ID를 찾을 수 없습니다 : " + username));
        
        // Spring Security의 User 객체 반환(권한은 일단 비워둠)
        return new org.springframework.security.core.userdetails.User(
                user.getUserId(),   // Principal (ID)
                user.getPassword(), // Credential (해시된 비밀번호)
                Collections.emptyList()  // Authorities (권한 목록)
        );
    }
    
    // 로그인 로직

    // 내부 Primary Key(PK) ID로 사용자 엔티티를 조회
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 PK ID를 찾을 수 없습니다 : " + id));
    }
}
