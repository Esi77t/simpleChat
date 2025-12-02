package com.example.chat.repository;

import com.example.chat.model.ReadReceipt;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReadReceiptRepository extends JpaRepository<ReadReceipt, String> {
    // boolean existsByMessageIdAndAccountId(String messageId, String accountId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ReadReceipt r WHERE r.messageId = :messageId AND r.accountId = :accountId")
    Optional<ReadReceipt> findByMessageIdAndAccountIdWithLock(String messageId, String accountId);

    long countByMessageId(String messageId);
}
