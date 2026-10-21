package com.edupulse.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "attempt_answers")
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private Attempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "chosen_index")
    private Integer chosenIndex;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect = false;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds = 0;

    public AttemptAnswer() {
    }

    public AttemptAnswer(Attempt attempt, Question question, Integer chosenIndex, boolean isCorrect, Integer timeTakenSeconds) {
        this.attempt = attempt;
        this.question = question;
        this.chosenIndex = chosenIndex;
        this.isCorrect = isCorrect;
        this.timeTakenSeconds = timeTakenSeconds != null ? timeTakenSeconds : 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Attempt getAttempt() {
        return attempt;
    }

    public void setAttempt(Attempt attempt) {
        this.attempt = attempt;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public Integer getChosenIndex() {
        return chosenIndex;
    }

    public void setChosenIndex(Integer chosenIndex) {
        this.chosenIndex = chosenIndex;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }
}
