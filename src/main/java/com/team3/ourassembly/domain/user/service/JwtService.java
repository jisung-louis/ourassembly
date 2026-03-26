package com.team3.ourassembly.domain.user.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    private String secret = "123456789123456789123456789123456789";
    private Key secretKey = Keys.hmacShaKeyFor(secret.getBytes());

    //토큰 발급
    public String createToken(Long id , String role){
        String token = Jwts.builder()
                .claim("id",id)
                .claim("role",role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*60))
                .signWith(secretKey , SignatureAlgorithm.HS256)
                .compact();
        return token;
    }

    // 토큰 추출
    public JwtDto getClaim(String token){
        try{
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            JwtDto jwtDto = new JwtDto();
            jwtDto.setId((Long) claims.get("id"));
            jwtDto.setRole(claims.get("role").toString());
            return jwtDto;
        }catch (Exception e){System.out.println(e);}
        return null;
    }
}//ㅁㅁ
