/* ===== 메인 버튼 ===== */
#community-board-toggle {
    position: relative;
    cursor: pointer;
    font-size: 1.2em;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.2s;
    user-select: none;
    -webkit-user-select: none;
}
#community-board-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
#community-board-toggle.active {
    color: #e53935;
}

/* ===== 뱃지 ===== */
.cb-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background-color: #e53935;
    color: white;
    font-size: 0.55em;
    font-weight: bold;
    min-width: 14px;
    height: 14px;
    border-radius: 7px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 3px;
}
