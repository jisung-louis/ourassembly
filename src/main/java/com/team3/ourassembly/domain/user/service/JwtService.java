package com.team3.ourassembly.domain.user.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private String secret = "123456789123456789123456789123456789";
    private Key secretKey = Keys.hmacShaKeyFor(secret.getBytes());

    //토큰 발급
    public String createToken(Integer id){
        String token = Jwts.builder()
                .claim("id",id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()*1000*60))
                .signWith(secretKey , SignatureAlgorithm.HS256)
                .compact();
        return token;
    }


}
