package com.eric.chattolini_10;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class Application implements CommandLineRunner{

	@Autowired
	private JdbcTemplate jdbcTemplate;
	private final String url = "jdbc:postgresql://localhost:5432/testdb";
    private final String pgUser = "postgres";
    private final String pgPassword = "204046";
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	protected String getSaltString() {
        String SALTCHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder salt = new StringBuilder();
        Random rnd = new Random();
        while (salt.length() < 8) { // length of the random string.
            int index = (int) (rnd.nextFloat() * SALTCHARS.length());
            salt.append(SALTCHARS.charAt(index));
        }
        String saltStr = salt.toString();
        return saltStr;

    }
	@Override
	public void run(String... args) throws Exception {
		byte[] array = new byte[4]; // length is bounded by 4
    	new Random().nextBytes(array);
    	String randUser = getSaltString();
		new Random().nextBytes(array);
		String randPass = getSaltString();
		String insertStr = "INSERT INTO table1 (usernames, passwords) VALUES (?, ?)";
		Connection con = DriverManager.getConnection(url, pgUser, pgPassword);
		
		try (PreparedStatement pst = con.prepareStatement(insertStr)) {
			pst.setString(1, randUser);
			pst.setString(2, randPass);
			int row = pst.executeUpdate();
			if (row > 0) {
				System.out.println("A new row has been inserted.");
			}
		}	
	}

}
