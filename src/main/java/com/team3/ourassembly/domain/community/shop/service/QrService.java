package com.team3.ourassembly.domain.community.shop.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class QrService {

    @Value("${qr.save.path}")
    private String savePath;


    // QR코드 생성
    public String generateQr(String uuid) {
        try {

            Path dirPath = Paths.get(savePath);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }


            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(uuid, BarcodeFormat.QR_CODE, 200, 200);


            String fileName = uuid + ".png";
            Path filePath = dirPath.resolve(fileName);
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

            return "/qr-images/" + fileName;

        } catch (Exception e){System.out.println(e);}

        return null;
    }
}
