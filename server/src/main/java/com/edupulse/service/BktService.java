package com.edupulse.service;

import org.springframework.stereotype.Service;

/**
 * Bayesian Knowledge Tracing (BKT) Service.
 * Implements standard Corbett & Anderson BKT model for student topic mastery tracking.
 */
@Service
public class BktService {

    // Standard BKT Default Parameters
    public static final double DEFAULT_P_INIT = 0.30;
    public static final double DEFAULT_P_LEARN = 0.20;
    public static final double DEFAULT_P_GUESS = 0.20;
    public static final double DEFAULT_P_SLIP = 0.10;

    public static final double WEAK_TOPIC_THRESHOLD = 0.50;
    public static final double STRONG_TOPIC_THRESHOLD = 0.80;

    public static class BktParameters {
        private final double pInit;
        private final double pLearn;
        private final double pGuess;
        private final double pSlip;

        public BktParameters(double pInit, double pLearn, double pGuess, double pSlip) {
            validateProbability(pInit, "pInit");
            validateProbability(pLearn, "pLearn");
            validateProbability(pGuess, "pGuess");
            validateProbability(pSlip, "pSlip");

            if (pGuess + pSlip >= 1.0) {
                throw new IllegalArgumentException("pGuess + pSlip must be strictly less than 1.0 to preserve learning validity");
            }

            this.pInit = pInit;
            this.pLearn = pLearn;
            this.pGuess = pGuess;
            this.pSlip = pSlip;
        }

        public static BktParameters defaults() {
            return new BktParameters(DEFAULT_P_INIT, DEFAULT_P_LEARN, DEFAULT_P_GUESS, DEFAULT_P_SLIP);
        }

        public double getPInit() { return pInit; }
        public double getPLearn() { return pLearn; }
        public double getPGuess() { return pGuess; }
        public double getPSlip() { return pSlip; }
    }

    /**
     * Updates pKnown based on answer correctness using default BKT parameters.
     *
     * @param currentPKnown Current estimated mastery (0.0 to 1.0)
     * @param isCorrect     Whether student answered correctly
     * @return Updated pKnown estimate bounded between [0.0001, 0.9999]
     */
    public double updateMastery(double currentPKnown, boolean isCorrect) {
        return updateMastery(currentPKnown, isCorrect, BktParameters.defaults());
    }

    /**
     * Updates pKnown with custom parameters.
     */
    public double updateMastery(double currentPKnown, boolean isCorrect, BktParameters params) {
        validateProbability(currentPKnown, "currentPKnown");

        // Clamp extreme boundaries to prevent numerical instability
        double p = Math.max(0.0001, Math.min(0.9999, currentPKnown));

        double slip = params.getPSlip();
        double guess = params.getPGuess();
        double learn = params.getPLearn();

        double posterior;
        if (isCorrect) {
            // Posterior given correct answer:
            // P(L | Correct) = P(L) * (1 - slip) / [ P(L) * (1 - slip) + (1 - P(L)) * guess ]
            double numerator = p * (1.0 - slip);
            double denominator = numerator + (1.0 - p) * guess;
            posterior = numerator / denominator;
        } else {
            // Posterior given incorrect answer:
            // P(L | Incorrect) = P(L) * slip / [ P(L) * slip + (1 - P(L)) * (1 - guess) ]
            double numerator = p * slip;
            double denominator = numerator + (1.0 - p) * (1.0 - guess);
            posterior = numerator / denominator;
        }

        // Apply learning transition:
        // P(L_{t+1}) = Posterior + (1 - Posterior) * P(T)
        double newPKnown = posterior + (1.0 - posterior) * learn;

        // Round to 4 decimal places and clamp
        return Math.round(Math.max(0.0001, Math.min(0.9999, newPKnown)) * 10000.0) / 10000.0;
    }

    private static void validateProbability(double val, String name) {
        if (Double.isNaN(val) || val < 0.0 || val > 1.0) {
            throw new IllegalArgumentException(name + " must be a valid probability between 0.0 and 1.0. Given: " + val);
        }
    }
}
