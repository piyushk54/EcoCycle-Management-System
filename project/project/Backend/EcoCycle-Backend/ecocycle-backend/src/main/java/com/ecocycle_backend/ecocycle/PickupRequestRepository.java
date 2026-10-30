
package com.ecocycle_backend.ecocycle;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PickupRequestRepository
        extends JpaRepository<PickupRequest, Long> {

    Optional<PickupRequest> findByTrackingId(String trackingId);
}
