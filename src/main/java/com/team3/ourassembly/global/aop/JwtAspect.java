package com.team3.ourassembly.global.aop;


import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class JwtAspect {

    private final JwtService jwtService;
    private final HttpServletRequest request;

    @Around("@annotation(token)")
    public Object checkToken(ProceedingJoinPoint joinPoint , Token token) throws Throwable {

        String loginToken = request.getHeader("Authorization");

        if(loginToken == null || !loginToken.startsWith("Bearer ")){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String inToken = loginToken.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);
        if(jwtDto == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = token.role();
        if (!role.equals("any") && !role.equals(jwtDto.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        request.setAttribute("userId", jwtDto.getId());
        request.setAttribute("role", jwtDto.getRole());

        System.out.println("AOP실행");
        return joinPoint.proceed();

    }
}
