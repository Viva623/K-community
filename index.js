/* ===== 미리보기 버튼 ===== */
.cb-open-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px 14px;
    background-color: #f1f3f5;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.9em;
    color: #495057;
    transition: all 0.2s;
}
.cb-open-button:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
}
.cb-open-icon {
    font-size: 1.2em;
}

/* ===== 팝업 오버레이 ===== */
.cb-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: cb-fade-in 0.2s ease;
}

@keyframes cb-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* ===== 팝업 본체 ===== */
.cb-popup {
    position: relative;
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: cb-slide-up 0.25s ease;
}

@keyframes cb-slide-up {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* ===== 닫기 버튼 ===== */
.cb-popup-close {
    position: absolute;
    top: 10px;
    right: 14px;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    color: #868e96;
    cursor: pointer;
    border-radius: 50%;
    z-index: 10;
    transition: all 0.2s;
}
.cb-popup-close:hover {
    background-color: #f1f3f5;
    color: #495057;
}

/* ===== 팝업 내부 스크롤 ===== */
.cb-popup-content {
    overflow-y: auto;
    max-height: 85vh;
}

/* ===== 팝업 안의 board-container 스타일 오버라이드 ===== */
.cb-popup .board-container {
    border: none;
    border-radius: 0;
    max-width: 100%;
}
