"""
Receipt Scanner Service - OCR + AI Vision
Scans receipts using OCR and AI to extract transaction information
"""
import os
import base64
import logging
from typing import Dict, Optional
from datetime import date
from PIL import Image
import io

logger = logging.getLogger(__name__)


class ReceiptScannerService:
    """Service for scanning receipts using OCR and AI"""
    
    def __init__(self):
        self.use_ocr = os.getenv("USE_OCR", "true").lower() == "true"
        self.use_ai = os.getenv("USE_AI_VISION", "true").lower() == "true"
        self.ai_provider = os.getenv("AI_PROVIDER", "openai")  # openai or anthropic
        
    async def scan_receipt(self, image_data: bytes) -> Dict:
        """
        Scan receipt image and extract transaction information
        
        Args:
            image_data: Image bytes
            
        Returns:
            Dict with extracted information:
            {
                "amount": float,
                "date": str (YYYY-MM-DD),
                "category": str,
                "title": str,
                "description": str,
                "items": list[str],
                "merchant": str
            }
        """
        try:
            # Convert image to base64 for AI
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Step 1: OCR extraction (if enabled)
            ocr_text = ""
            if self.use_ocr:
                ocr_text = await self._extract_text_ocr(image_data)
                logger.info(f"OCR extracted text: {ocr_text[:200]}...")
            
            # Step 2: AI extraction (if enabled)
            extracted_data = {}
            if self.use_ai:
                extracted_data = await self._extract_with_ai(image_base64, ocr_text)
            else:
                # Fallback to simple OCR parsing
                extracted_data = self._parse_ocr_text(ocr_text)
            
            # Step 3: Validate and normalize data
            normalized = self._normalize_data(extracted_data)
            
            return normalized
            
        except Exception as e:
            logger.error(f"Error scanning receipt: {str(e)}", exc_info=True)
            raise Exception(f"Failed to scan receipt: {str(e)}")
    
    async def _extract_text_ocr(self, image_data: bytes) -> str:
        """Extract text from image using OCR"""
        try:
            # Try to use pytesseract if available
            try:
                import pytesseract
                from PIL import Image
                
                image = Image.open(io.BytesIO(image_data))
                text = pytesseract.image_to_string(image, lang='eng+uzb')
                return text
            except ImportError:
                logger.warning("pytesseract not available, using fallback")
                # Fallback: return empty string, AI will handle it
                return ""
        except Exception as e:
            logger.warning(f"OCR extraction failed: {str(e)}")
            return ""
    
    async def _extract_with_ai(self, image_base64: str, ocr_text: str) -> Dict:
        """Extract information using AI Vision"""
        try:
            if self.ai_provider == "openai":
                return await self._extract_with_openai(image_base64, ocr_text)
            elif self.ai_provider == "anthropic":
                return await self._extract_with_anthropic(image_base64, ocr_text)
            else:
                logger.warning(f"Unknown AI provider: {self.ai_provider}, using fallback")
                return self._parse_ocr_text(ocr_text)
        except Exception as e:
            logger.error(f"AI extraction failed: {str(e)}")
            # Fallback to OCR parsing
            return self._parse_ocr_text(ocr_text)
    
    async def _extract_with_openai(self, image_base64: str, ocr_text: str) -> Dict:
        """Extract using OpenAI GPT-4 Vision"""
        try:
            import openai
            
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OPENAI_API_KEY not set, using fallback")
                return self._parse_ocr_text(ocr_text)
            
            client = openai.OpenAI(api_key=api_key)
            
            prompt = """Extract transaction information from this receipt image. 
Return a JSON object with the following structure:
{
    "amount": float (total amount),
    "date": "YYYY-MM-DD" (transaction date, use today if not found),
    "category": string (one of: Oziq-ovqat, Transport, Boshqa, Maosh, Xizmatlar),
    "title": string (merchant/store name or main item),
    "description": string (brief description),
    "items": array of strings (list of purchased items),
    "merchant": string (store/merchant name)
}

If OCR text is provided, use it to help extract information.
If date is not found, use today's date.
If category cannot be determined, use "Boshqa".
"""
            
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt + (f"\n\nOCR Text:\n{ocr_text}" if ocr_text else "")
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
            
            response = client.chat.completions.create(
                model="gpt-4o",  # or gpt-4-vision-preview
                messages=messages,
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result
            
        except ImportError:
            logger.warning("openai library not installed")
            return self._parse_ocr_text(ocr_text)
        except Exception as e:
            logger.error(f"OpenAI extraction error: {str(e)}")
            return self._parse_ocr_text(ocr_text)
    
    async def _extract_with_anthropic(self, image_base64: str, ocr_text: str) -> Dict:
        """Extract using Anthropic Claude Vision"""
        try:
            import anthropic
            
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                logger.warning("ANTHROPIC_API_KEY not set, using fallback")
                return self._parse_ocr_text(ocr_text)
            
            client = anthropic.Anthropic(api_key=api_key)
            
            prompt = """Extract transaction information from this receipt image. 
Return a JSON object with the following structure:
{
    "amount": float (total amount),
    "date": "YYYY-MM-DD" (transaction date, use today if not found),
    "category": string (one of: Oziq-ovqat, Transport, Boshqa, Maosh, Xizmatlar),
    "title": string (merchant/store name or main item),
    "description": string (brief description),
    "items": array of strings (list of purchased items),
    "merchant": string (store/merchant name)
}

If OCR text is provided, use it to help extract information.
If date is not found, use today's date.
If category cannot be determined, use "Boshqa".
""" + (f"\n\nOCR Text:\n{ocr_text}" if ocr_text else "")
            
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_base64
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )
            
            import json
            # Extract JSON from response
            content = message.content[0].text
            # Try to find JSON in the response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(content)
            
            return result
            
        except ImportError:
            logger.warning("anthropic library not installed")
            return self._parse_ocr_text(ocr_text)
        except Exception as e:
            logger.error(f"Anthropic extraction error: {str(e)}")
            return self._parse_ocr_text(ocr_text)
    
    def _parse_ocr_text(self, ocr_text: str) -> Dict:
        """Simple OCR text parsing fallback"""
        import re
        from datetime import date
        
        result = {
            "amount": 0.0,
            "date": date.today().isoformat(),
            "category": "Boshqa",
            "title": "Yangi xarajat",
            "description": "",
            "items": [],
            "merchant": ""
        }
        
        if not ocr_text:
            return result
        
        # Try to extract amount (look for numbers with currency symbols)
        amount_patterns = [
            r'(\d+[.,]\d+)\s*(?:UZS|so\'m|sum|₽|\$|€)',
            r'(?:UZS|so\'m|sum|₽|\$|€)\s*(\d+[.,]\d+)',
            r'Jami[:\s]+(\d+[.,]\d+)',
            r'Total[:\s]+(\d+[.,]\d+)',
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, ocr_text, re.IGNORECASE)
            if match:
                try:
                    amount_str = match.group(1).replace(',', '.')
                    result["amount"] = float(amount_str)
                    break
                except ValueError:
                    continue
        
        # Try to extract date
        date_patterns = [
            r'(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})',
            r'(\d{4})[./-](\d{1,2})[./-](\d{1,2})',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, ocr_text)
            if match:
                try:
                    # Simple date parsing (could be improved)
                    result["date"] = date.today().isoformat()  # For now, use today
                    break
                except:
                    continue
        
        # Extract merchant/store name (first line or after certain keywords)
        lines = ocr_text.split('\n')
        if lines:
            result["merchant"] = lines[0].strip()[:50]
            result["title"] = lines[0].strip()[:50] or "Yangi xarajat"
        
        return result
    
    def _normalize_data(self, data: Dict) -> Dict:
        """Normalize and validate extracted data"""
        from datetime import date
        
        normalized = {
            "amount": float(data.get("amount", 0.0)),
            "date": data.get("date", date.today().isoformat()),
            "category": data.get("category", "Boshqa"),
            "title": data.get("title", "Yangi xarajat") or "Yangi xarajat",
            "description": data.get("description", ""),
            "items": data.get("items", []),
            "merchant": data.get("merchant", "")
        }
        
        # Validate date format
        try:
            date.fromisoformat(normalized["date"])
        except (ValueError, TypeError):
            normalized["date"] = date.today().isoformat()
        
        # Ensure amount is positive
        normalized["amount"] = abs(normalized["amount"])
        
        # Validate category
        valid_categories = ["Oziq-ovqat", "Transport", "Boshqa", "Maosh", "Xizmatlar"]
        if normalized["category"] not in valid_categories:
            normalized["category"] = "Boshqa"
        
        # Build description from items if available
        if normalized["items"] and not normalized["description"]:
            items_str = ", ".join(normalized["items"][:3])
            normalized["description"] = f"Mahsulotlar: {items_str}"
        
        return normalized


