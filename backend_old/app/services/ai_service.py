import anthropic
import groq
from app.core.config import settings
import base64
import json
import re

class AIService:
    def __init__(self):
        self.anthropic_client = None
        self.groq_client = None
        
        if hasattr(settings, "ANTHROPIC_API_KEY") and settings.ANTHROPIC_API_KEY:
            self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            
        if hasattr(settings, "GROQ_API_KEY") and settings.GROQ_API_KEY:
            self.groq_client = groq.Groq(api_key=settings.GROQ_API_KEY)

    async def analyze_case(self, case_data: dict, images: list):
        """
        Analyzes a teledermatology case using AI (Groq or Claude).
        Prioritizes vision models for image analysis.
        """
        # If we have images, prioritize Claude 3 (better vision support)
        if images and self.anthropic_client:
            return await self._analyze_with_anthropic(case_data, images)
        
        # If Groq is available and no Claude or no images, use Groq
        if self.groq_client:
            return await self._analyze_with_groq(case_data, images)
        
        # Fallback to Claude if no Groq
        if self.anthropic_client:
            return await self._analyze_with_anthropic(case_data, images)

        # Mock analysis for development
        return {
            "hypothesis": "Hipótese diagnóstica simulada: Possível Ceratose Actínica.",
            "urgency": "prioritario",
            "cid10": "L57.0",
            "reasoning": "A lesão apresenta bordas irregulares e descamação, compatível com exposição solar crônica (Mock)."
        }

    async def _analyze_with_groq(self, case_data: dict, images: list):
        """
        Analysis using Groq Llama 3.3.
        Note: Currently focused on clinical data analysis if vision models are unstable.
        """
        prompt = (
            "Você é um especialista em teledermatologia. Analise os dados clínicos abaixo e forneça uma pré-triagem.\n"
            "Dados clínicos: {case_data}\n\n"
            "Forneça sua análise em formato JSON com os seguintes campos:\n"
            "- 'hypothesis': sua principal hipótese diagnóstica.\n"
            "- 'urgency': classificação de risco (rotina, prioritario, urgente).\n"
            "- 'cid10': código CID-10 sugerido.\n"
            "- 'reasoning': justificativa clínica para sua hipótese.\n\n"
            "Responda APENAS o objeto JSON."
        ).format(case_data=json.dumps(case_data, ensure_ascii=False))

        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]

        # Llama 3.3 70B on Groq is excellent for clinical reasoning
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return {
                "hypothesis": "Erro na análise automática (Groq).",
                "urgency": "rotina",
                "cid10": "N/A",
                "reasoning": f"Falha na comunicação com o serviço de IA: {str(e)}"
            }

    async def _analyze_with_anthropic(self, case_data: dict, images: list):
        """
        Analysis using Claude 3 Vision (Sonnet).
        Highly capable of analyzing dermatological images.
        """
        prompt = (
            "Você é um dermatologista sênior. Analise este caso de teledermatologia, incluindo os dados clínicos e as imagens fornecidas.\n"
            "Dados clínicos: {case_data}\n\n"
            "Sua tarefa é realizar uma pré-triagem para o regulador.\n"
            "Forneça sua análise estritamente em formato JSON com os seguintes campos:\n"
            "- 'hypothesis': principal hipótese diagnóstica.\n"
            "- 'urgency': nível de urgência (rotina, prioritario, urgente).\n"
            "- 'cid10': CID-10 sugerido.\n"
            "- 'reasoning': breve explicação clínica baseada nas fotos e dados.\n\n"
            "Responda APENAS o JSON."
        ).format(case_data=json.dumps(case_data, ensure_ascii=False))

        content = [{"type": "text", "text": prompt}]

        for img_path in images:
            try:
                with open(img_path, "rb") as f:
                    img_data = base64.b64encode(f.read()).decode("utf-8")
                    content.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": img_data
                        }
                    })
            except Exception as e:
                print(f"Error loading image {img_path}: {e}")

        try:
            message = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1024,
                messages=[{"role": "user", "content": content}]
            )

            text_response = message.content[0].text
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            
            return {
                "hypothesis": text_response, 
                "urgency": "prioritario", 
                "cid10": "N/A",
                "reasoning": "Não foi possível extrair dados estruturados."
            }
        except Exception as e:
            print(f"Error calling Anthropic API: {e}")
            return {
                "hypothesis": "Erro na análise automática (Claude).", 
                "urgency": "rotina", 
                "cid10": "N/A",
                "reasoning": f"Erro na API da Anthropic: {str(e)}"
            }

ai_service = AIService()
