package com.eric.chattolini_10;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "table1")
public class User {
    private String usernames;
    private String passwords;
    
    public String getUsernames() {
        return usernames;
    }
    public void setUsernames(String usernames) {
        this.usernames = usernames;
    }
    public String getPasswords() {
        return passwords;
    }
    public void setPasswords(String passwords) {
        this.passwords = passwords;
    }
    @Override
    public String toString() {
        return "User [passwords=" + passwords + ", usernames=" + usernames + "]";
    }
    
}
