package com.example.chat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;

@Entity
@AllArgsConstructor
@Table(name = "read_receipt", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"message_id", "account_id"})
})
public class ReadReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String messageId;
    private String accountId;

    protected ReadReceipt() {}

    public ReadReceipt(String messageId, String accountId) {
        this.messageId = messageId;
        this.accountId = accountId;
    }
}
