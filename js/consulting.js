// Consulting page - Gemini API powered chatbot
// 입시멘토: 대한민국 입시 전문 컨설턴트

const GEMINI_API_KEY = 'AIzaSyAwAHG4jNlgK-Sh9b2Pq2h7hqhTBE5LzIE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

let currentCategory = '고입';
let conversationHistory = [];
let isWaitingResponse = false;

// 입시멘토 시스템 프롬프트
const SYSTEM_PROMPT = `# 역할 정의
너는 대한민국 입시 전문 컨설턴트 "입시멘토"야. 고등학교 입시(고입)와 대학교 입시(대입) 전반에 걸쳐 학생과 학부모에게 전문적이고 신뢰할 수 있는 상담을 제공해.

# 전문 분야
## 고입 (고등학교 입시)
- 영재학교 (서울과학고, KAIST부설한국과학영재학교, 대구과학고 등 8개교)
- 과학고등학교 (전국 20개교)
- 외국어고등학교, 국제고등학교
- 자율형사립고등학교
- 일반고 및 특성화고

## 대입 (대학교 입시)
- 수시전형: 학생부교과, 학생부종합, 논술, 실기/특기자
- 정시전형: 수능 위주
- 주요 대학별 전형 특징 및 인재상
- 학생부종합전형 서류 및 면접 준비

# 핵심 역량
1. **맞춤형 전략 수립**
   - 학생의 현재 성적, 비교과 활동, 관심 분야를 종합 분석
   - 실현 가능한 목표 설정과 단계별 로드맵 제시

2. **서류 컨설팅**
   - 자기소개서 구조 및 내용 피드백
   - 학생부 기재 방향 조언
   - 활동 기획 및 연계 전략

3. **면접 준비**
   - 학교별 면접 유형 안내 (서류 기반, 제시문 기반, 구술 등)
   - 예상 질문 및 답변 전략
   - 모의 면접 연습

4. **정보 제공**
   - 전형 일정 및 변경 사항 안내
   - 경쟁률, 입결 등 데이터 기반 분석
   - 학교별 특징 및 분위기

# 상담 원칙
1. **정확성**: 최신 입시 정보를 바탕으로 답변하되, 확실하지 않은 정보는 반드시 확인을 권유해
2. **개인화**: 일반론보다 학생 개인의 상황에 맞는 구체적 조언 제공
3. **균형**: 희망과 현실 사이에서 균형 잡힌 시각 유지. 무조건적 낙관이나 비관 지양
4. **윤리**: 허위 스펙, 대리 작성 등 부정행위는 절대 조언하지 않음
5. **공감**: 입시 스트레스를 이해하고 정서적 지지도 함께 제공

# 응답 스타일
- 친근하지만 전문적인 톤 유지 (존댓말 사용)
- 복잡한 입시 용어는 쉽게 풀어서 설명
- 질문에 바로 답하되, 필요시 추가 정보 요청
- 구체적인 행동 계획이나 다음 단계를 제시
- 장문의 나열보다 핵심 위주로 명확하게 전달
- 응답은 300자 이내로 간결하게

# 상담 시작 시
첫 상담이라면 다음 정보를 자연스럽게 파악해:
- 현재 학년
- 관심 있는 학교/전형
- 현재 성적 수준 (내신, 모의고사 등)
- 주요 비교과 활동
- 고민이나 목표

# 주의사항
- 특정 학원, 컨설팅 업체 추천 금지
- 입시 결과를 보장하는 표현 금지
- 모든 조언은 참고용이며, 최종 결정은 학생과 학부모의 몫임을 명시`;

// 카테고리별 컨텍스트
const categoryContext = {
    '고입': '현재 고입(고등학교 입시) 상담 모드입니다. 영재고, 과학고, 외고, 자사고, 일반고 등에 대해 상담해주세요.',
    '대입': '현재 대입(대학교 입시) 상담 모드입니다. 수시, 정시, 학종, 논술 등에 대해 상담해주세요.',
    '공부법': '현재 학습 방법 상담 모드입니다. 효과적인 공부법, 집중력, 시간 관리 등에 대해 상담해주세요.'
};

// Gemini API 호출
async function callGeminiAPI(userMessage) {
    const contextMessage = categoryContext[currentCategory];
    
    // 대화 히스토리 구성
    const contents = [];
    
    // 시스템 프롬프트 + 카테고리 컨텍스트를 첫 메시지로
    contents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\n' + contextMessage }]
    });
    contents.push({
        role: 'model',
        parts: [{ text: '안녕하세요! 입시멘토입니다. 무엇을 도와드릴까요? 😊' }]
    });
    
    // 이전 대화 히스토리 추가
    for (const msg of conversationHistory) {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    }
    
    // 현재 사용자 메시지 추가
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API 호출 실패: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('응답 형식 오류');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// 로딩 표시 추가
function addLoadingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message loading-message';
    messageDiv.id = 'loadingMessage';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 로딩 제거
function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Add message to chat
function addMessage(content, isBot = true) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isBot ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (Array.isArray(content)) {
        content.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            messageContent.appendChild(p);
        });
    } else {
        // 마크다운 스타일의 굵은 글씨(**text**) 처리
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        const p = document.createElement('p');
        p.innerHTML = formattedContent;
        messageContent.appendChild(p);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle send message
async function handleSendMessage() {
    if (isWaitingResponse) return;
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, false);
    input.value = '';
    
    // 대화 히스토리에 사용자 메시지 추가
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // 로딩 표시
    isWaitingResponse = true;
    addLoadingMessage();
    
    try {
        // Gemini API 호출
        const response = await callGeminiAPI(message);
        
        // 로딩 제거
        removeLoadingMessage();
        
        // 응답 표시
        addMessage(response, true);
        
        // 대화 히스토리에 봇 응답 추가
        conversationHistory.push({
            role: 'assistant',
            content: response
        });
        
        // Save to chat history
        saveToHistory(message, response);
        
    } catch (error) {
        removeLoadingMessage();
        addMessage('죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 🙏', true);
        console.error('Error:', error);
    } finally {
        isWaitingResponse = false;
    }
}

// Save chat to history
async function saveToHistory(userMessage, botResponse) {
    const responseText = Array.isArray(botResponse) ? botResponse.join('\n') : botResponse;
    
    await createRecord('chat_history', {
        id: generateUUID(),
        category: currentCategory,
        message: userMessage,
        response: responseText,
        timestamp: new Date().toISOString()
    });
}

// 대화 히스토리 초기화
function resetConversation() {
    conversationHistory = [];
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>안녕하세요! 입시멘토입니다. 😊</p>
                <p>${currentCategory === '고입' ? '고등학교 입시(영재고, 과학고, 외고, 자사고 등)에 대해' : 
                   currentCategory === '대입' ? '대학교 입시(수시, 정시, 학종 등)에 대해' : 
                   '효과적인 공부법과 학습 전략에 대해'} 궁금하신 점을 물어보세요!</p>
            </div>
        </div>
    `;
}

// Initialize consulting page
document.addEventListener('DOMContentLoaded', () => {
    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            
            // 대화 초기화
            resetConversation();
            
            // Add system message
            addMessage(`${currentCategory === '고입' ? '고입(고등학교 입시)' : 
                       currentCategory === '대입' ? '대입(대학교 입시)' : 
                       '학습 방법'} 상담 모드로 변경되었습니다. 궁금하신 점을 물어보세요! 😊`, true);
        });
    });
    
    // Send button
    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', handleSendMessage);
    
    // Enter key to send
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Quick question buttons
    const quickQuestionButtons = document.querySelectorAll('.quick-question-btn');
    quickQuestionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            document.getElementById('chatInput').value = question;
            handleSendMessage();
        });
    });
});
