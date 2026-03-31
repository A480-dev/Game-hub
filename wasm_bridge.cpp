#include <string>
#include <unordered_map>
#include <emscripten.h>

extern "C" {

struct HighScore {
    int gameId;
    std::string gameName;
    int score;
    std::string timestamp;
};

static std::unordered_map<int, HighScore> scoreTable;

EMSCRIPTEN_KEEPALIVE
void initScoreTable() {
    scoreTable.clear();
}

EMSCRIPTEN_KEEPALIVE
int setHighScore(int gameId, const char* gameName, int score) {
    auto it = scoreTable.find(gameId);
    if (it == scoreTable.end() || score > it->second.score) {
        scoreTable[gameId] = {gameId, std::string(gameName), score, "2026-03-31"};
        return 1;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int getHighScore(int gameId) {
    auto it = scoreTable.find(gameId);
    if (it != scoreTable.end()) {
        return it->second.score;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
const char* getGameName(int gameId) {
    auto it = scoreTable.find(gameId);
    if (it != scoreTable.end()) {
        return it->second.gameName.c_str();
    }
    return "";
}

EMSCRIPTEN_KEEPALIVE
int getTotalGames() {
    return scoreTable.size();
}

EMSCRIPTEN_KEEPALIVE
int getAverageScore() {
    if (scoreTable.empty()) return 0;
    
    int total = 0;
    for (const auto& pair : scoreTable) {
        total += pair.second.score;
    }
    return total / scoreTable.size();
}

EMSCRIPTEN_KEEPALIVE
void clearScores() {
    scoreTable.clear();
}

EMSCRIPTEN_KEEPALIVE
int getTableSize() {
    return sizeof(scoreTable);
}

}
