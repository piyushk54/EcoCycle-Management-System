
package com.ecocycle_backend.ecocycle;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pickups")
@CrossOrigin(origins = "*")
public class PickupRequestController {

    private final PickupRequestRepository repository;

    public PickupRequestController(PickupRequestRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> createPickup(
            @RequestBody PickupRequest request) {

        request.setTrackingId(
            "EC-" + UUID.randomUUID()
                .toString().substring(0, 8).toUpperCase()
        );

        try {
            PickupRequest saved = repository.save(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Pickup request saved successfully!",
                    "trackingId", saved.getTrackingId(),
                    "status", saved.getStatus() == null
                        ? "Pending" : saved.getStatus()
                )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Could not save pickup request.")
            );
        }
    }

    @GetMapping("/{trackingId}")
    public ResponseEntity<?> getPickup(
            @PathVariable String trackingId) {

        return repository.findByTrackingId(trackingId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
