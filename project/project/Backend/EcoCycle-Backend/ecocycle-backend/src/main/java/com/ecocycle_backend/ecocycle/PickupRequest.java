
package com.ecocycle_backend.ecocycle;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_requests")
public class PickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_id", unique = true)
    private String trackingId;

    @Column(name = "full_name")
    private String fullName;

    private String phone;
    private String email;

    @Column(name = "e_waste_type")
    private String eWasteType;

    private String address;

    @Column(name = "pickup_date")
    private LocalDate pickupDate;

    private String status = "Pending";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public PickupRequest() {
    }

    public Long getId() { return id; }
    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEWasteType() { return eWasteType; }
    public void setEWasteType(String eWasteType) {
        this.eWasteType = eWasteType;
    }

    public String getAddress() { return address; }
    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) {
        this.pickupDate = pickupDate;
    }

    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
