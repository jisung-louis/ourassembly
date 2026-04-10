package com.team3.ourassembly.domain.community.shop.controller;


import com.google.firebase.database.core.Repo;
import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.domain.community.shop.dto.ProductDto;
import com.team3.ourassembly.domain.community.shop.service.ShopService;
import com.team3.ourassembly.global.aop.Token;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "Authorization")
public class ShopController {
    private final ShopService shopService;
    private final JwtService jwtService;


    //상품 등록
    @PostMapping("/product")
    @Token(role = "admin")
    public ResponseEntity<?> productPost(@RequestBody ProductDto productDto , HttpServletRequest request){

        request.get

        ProductDto newProduct = shopService.productPost(productDto);
        if(newProduct == null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(newProduct);
    }


    //상품 전체 조회
    @GetMapping("/product")
    public ResponseEntity<?> productGet(@RequestParam(defaultValue = "latest") String sort,
                                        @RequestParam(defaultValue = "1") int page,
                                        @RequestParam(defaultValue = "10") int size){

        Page<ProductDto> productPage = shopService.productGet(sort , page , size);
        if(productPage==null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(productPage);
    }

    //상품 상세 조회
    @GetMapping("/product/detail")
    public ResponseEntity<?> productDetail(@RequestParam Long productId){
        ProductDto productDto = shopService.productDetail(productId);
        if(productDto == null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(productDto);
    }

    //상품 수정
    @PutMapping("/product")
    public ResponseEntity<?> productUpdate(@RequestBody ProductDto productDto , @RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String inToken = token.replace("Bearer ", "");

        JwtDto jwtDto = jwtService.getClaim(inToken);

        String admin = jwtDto.getRole();
        if (!admin.equals("admin")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ProductDto update = shopService.productUpdate(productDto);
        if(update == null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(update);

    }

    //상품 삭제
    @DeleteMapping("/product")
    public ResponseEntity<?> productDelete(@RequestParam Long productId , @RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String inToken = token.replace("Bearer ", "");

        JwtDto jwtDto = jwtService.getClaim(inToken);

        String admin = jwtDto.getRole();
        if (!admin.equals("admin")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean delete = shopService.productDelete(productId);
        if(delete==false){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(delete);
    }

    // 상품 바코드 등록
    @PostMapping("/barcode")
    public ResponseEntity<?> barcode(@RequestBody BarcodeResponseDto barcode,
                                     @RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String inToken = token.replace("Bearer ", "");

        JwtDto jwtDto = jwtService.getClaim(inToken);

        String admin = jwtDto.getRole();
        if (!admin.equals("admin")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        BarcodeResponseDto newBarcode = shopService.barcode(barcode);
        if(newBarcode == null){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(newBarcode);
    }


}
