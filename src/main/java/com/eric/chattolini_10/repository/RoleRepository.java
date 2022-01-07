package com.eric.chattolini_10.repository;
import java.util.Optional;

import com.eric.chattolini_10.model.ERole;
import com.eric.chattolini_10.model.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>{
    Optional<Role> findByName(ERole name);
}
