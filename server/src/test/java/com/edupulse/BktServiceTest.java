package com.edupulse;

import com.edupulse.service.BktService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BktServiceTest {

    private BktService bktService;

    @BeforeEach
    void setUp() {
        bktService = new BktService();
    }

    @Test
    @DisplayName("1. Correct answer should increase estimated mastery (pKnown)")
    void testCorrectAnswerIncreasesMastery() {
        double initialP = 0.30;
        double updatedP = bktService.updateMastery(initialP, true);

        assertTrue(updatedP > initialP, "pKnown must increase after a correct answer");
        assertEquals(0.7273, updatedP, 0.005, "Expected posterior + learning update around 0.72");
    }

    @Test
    @DisplayName("2. Incorrect answer should decrease estimated mastery (pKnown)")
    void testIncorrectAnswerDecreasesMastery() {
        double initialP = 0.50;
        double updatedP = bktService.updateMastery(initialP, false);

        assertTrue(updatedP < initialP, "pKnown must decrease after an incorrect answer");
    }

    @Test
    @DisplayName("3. Consecutive correct answers should monotonically increase towards mastery")
    void testConsecutiveCorrectAnswers() {
        double p = 0.30;
        for (int i = 0; i < 5; i++) {
            double nextP = bktService.updateMastery(p, true);
            assertTrue(nextP > p);
            p = nextP;
        }
        assertTrue(p >= BktService.STRONG_TOPIC_THRESHOLD, "After 5 correct answers, pKnown should exceed strong threshold 0.80");
    }

    @Test
    @DisplayName("4. Boundary inputs 0.0 and 1.0 should be safely handled without NaN or overflow")
    void testBoundaryConditions() {
        double pZero = bktService.updateMastery(0.0, true);
        assertFalse(Double.isNaN(pZero));
        assertTrue(pZero > 0.0 && pZero <= 1.0);

        double pOne = bktService.updateMastery(1.0, false);
        assertFalse(Double.isNaN(pOne));
        assertTrue(pOne >= 0.0 && pOne < 1.0);
    }

    @Test
    @DisplayName("5. Invalid probability parameters must throw IllegalArgumentException")
    void testInvalidParameters() {
        assertThrows(IllegalArgumentException.class, () -> bktService.updateMastery(-0.5, true));
        assertThrows(IllegalArgumentException.class, () -> bktService.updateMastery(1.5, true));
        assertThrows(IllegalArgumentException.class, () -> bktService.updateMastery(Double.NaN, true));
    }
}
