package com.web.chatbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RoomCreateRequest {
    @NotBlank(message = "방 제목은 필수입니다.")
    @Size(min = 1, max = 50, message = "방 제목은 1자 이상, 50자 이하여야 합니다.")
    private String name;

    // 비공개 방일 경우에만 사용되며, null이 될 수 있습니다. 비밀번호는 Service 계층에서 해시됩니다.
    private String password;
}
