package com.edupulse.service;

import com.edupulse.entity.Question;
import com.edupulse.entity.Topic;
import com.edupulse.entity.User;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.QuestionRepository;
import com.edupulse.repository.TopicRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuestionService(QuestionRepository questionRepository, TopicRepository topicRepository) {
        this.questionRepository = questionRepository;
        this.topicRepository = topicRepository;
    }

    @Transactional(readOnly = true)
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsByTopic(Long topicId) {
        return questionRepository.findByTopicId(topicId);
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsBySubject(Long subjectId) {
        return questionRepository.findByTopicSubjectId(subjectId);
    }

    @Transactional(readOnly = true)
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));
    }

    @Transactional
    public Question createQuestion(Long topicId, String text, List<String> options,
                                   int correctIndex, Question.Difficulty difficulty,
                                   String explanation, Question.Source source, User creator) {
        validateQuestionInput(text, options, correctIndex, explanation);

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with ID: " + topicId));

        try {
            String optionsJson = objectMapper.writeValueAsString(options);
            Question question = new Question(topic, text.trim(), optionsJson, correctIndex,
                    difficulty, explanation.trim(), source, creator);
            return questionRepository.save(question);
        } catch (Exception ex) {
            throw new BadRequestException("Failed to serialize question options: " + ex.getMessage());
        }
    }

    public void validateQuestionInput(String text, List<String> options, int correctIndex, String explanation) {
        if (text == null || text.trim().isEmpty()) {
            throw new BadRequestException("Question text cannot be empty.");
        }
        if (options == null || options.size() != 4) {
            throw new BadRequestException("Every question must contain exactly 4 options. Found: " + (options == null ? 0 : options.size()));
        }
        for (int i = 0; i < options.size(); i++) {
            if (options.get(i) == null || options.get(i).trim().isEmpty()) {
                throw new BadRequestException("Option " + (i + 1) + " cannot be empty.");
            }
        }
        if (correctIndex < 0 || correctIndex > 3) {
            throw new BadRequestException("Correct answer index must be between 0 and 3. Given: " + correctIndex);
        }
        if (explanation == null || explanation.trim().isEmpty()) {
            throw new BadRequestException("Question must provide an explanation for learning feedback.");
        }
    }
}
