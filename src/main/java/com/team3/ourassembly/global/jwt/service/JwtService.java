package com.team3.ourassembly.global.jwt.service;

import com.team3.ourassembly.global.jwt.dto.JwtDto;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private String secret = "123456789123456789123456789123456789";
    private Key secretKey = Keys.hmacShaKeyFor(secret.getBytes());

    //토큰 발급
    public String createToken(Long id , String role, Long congressmanId){
        String token = Jwts.builder()
                .claim("id",id)
                .claim("role",role)
                .claim("congressmanId",congressmanId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*60))
                .signWith(secretKey , SignatureAlgorithm.HS256)
                .compact();
        return token;
    }

    // 토큰 추출
    public JwtDto getClaim(String token){
        System.out.println("토큰추출시작");
        try{
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();


            JwtDto jwtDto = new JwtDto();
            String cid = claims.get("id").toString();
            jwtDto.setId(Long.parseLong(cid));
            jwtDto.setRole(claims.get("role").toString());

            return jwtDto;
        }catch (Exception e){System.out.println(e);}
        return null;
    }
}
