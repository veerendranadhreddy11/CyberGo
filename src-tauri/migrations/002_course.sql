CREATE TABLE full_course_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    record_json TEXT NOT NULL
);
INSERT INTO full_course_state VALUES (1, '{"records":{},"badges":{}}');
