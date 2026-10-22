package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "material_chunks")
public class MaterialChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    @JsonIgnore
    private CourseMaterial material;

    @Column(name = "chunk_index", nullable = false)
    private int chunkIndex;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "word_count")
    private int wordCount;

    public MaterialChunk() {}

    public MaterialChunk(CourseMaterial material, int chunkIndex, String content, int wordCount) {
        this.material = material;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.wordCount = wordCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CourseMaterial getMaterial() { return material; }
    public void setMaterial(CourseMaterial material) { this.material = material; }

    public int getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(int chunkIndex) { this.chunkIndex = chunkIndex; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getWordCount() { return wordCount; }
    public void setWordCount(int wordCount) { this.wordCount = wordCount; }
}
