package com.sahid040601.catatanceklissuara;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int REQ_AUDIO = 1201;
    private static final String PREFS = "catatan_ceklis";
    private static final String KEY_ITEMS = "items";

    private LinearLayout taskContainer;
    private EditText taskInput;
    private TextView statusText;
    private TextView progressText;
    private Button micButton;
    private SpeechRecognizer speechRecognizer;
    private Intent speechIntent;
    private final ArrayList<Task> tasks = new ArrayList<>();
    private SharedPreferences prefs;

    private static class Task {
        String text;
        boolean done;
        Task(String text, boolean done) {
            this.text = text;
            this.done = done;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        taskContainer = findViewById(R.id.taskContainer);
        taskInput = findViewById(R.id.taskInput);
        statusText = findViewById(R.id.statusText);
        progressText = findViewById(R.id.progressText);
        micButton = findViewById(R.id.micButton);

        loadTasks();
        setupSpeech();
        refreshTaskList();

        findViewById(R.id.addButton).setOnClickListener(v -> addFromText());
        findViewById(R.id.clearDoneButton).setOnClickListener(v -> clearCompleted());
        findViewById(R.id.clearAllButton).setOnClickListener(v -> clearAll());
        micButton.setOnClickListener(v -> startVoiceInput());

        statusText.setText("Siap. Tekan mikrofon dan ucapkan perintah.");
    }

    private void setupSpeech() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            statusText.setText("Pengenalan suara tidak tersedia di perangkat ini.");
            micButton.setEnabled(false);
            return;
        }
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "id-ID");
        speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "id-ID");
        speechIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        speechIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);

        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { statusText.setText("Mendengarkan… silakan bicara."); }
            @Override public void onBeginningOfSpeech() { statusText.setText("Saya mendengar suara Anda…"); }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { statusText.setText("Memproses suara…"); }
            @Override public void onError(int error) {
                micButton.setText("🎙  Mulai Bicara");
                statusText.setText(errorMessage(error));
            }
            @Override public void onResults(Bundle results) {
                micButton.setText("🎙  Mulai Bicara");
                ArrayList<String> phrases = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (phrases != null && !phrases.isEmpty()) {
                    String command = phrases.get(0).trim();
                    statusText.setText("Perintah: " + command);
                    handleVoiceCommand(command);
                } else {
                    statusText.setText("Suara belum dikenali. Coba lagi.");
                }
            }
            @Override public void onPartialResults(Bundle partialResults) {
                ArrayList<String> phrases = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (phrases != null && !phrases.isEmpty()) statusText.setText("Mendengar: " + phrases.get(0));
            }
            @Override public void onEvent(int eventType, Bundle params) { }
        });
    }

    private String errorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO: return "Mikrofon bermasalah. Coba lagi.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "Izin mikrofon belum diberikan.";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "Koneksi untuk pengenalan suara bermasalah.";
            case SpeechRecognizer.ERROR_NO_MATCH: return "Ucapan tidak dikenali. Coba bicara lebih jelas.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: return "Pengenalan suara sedang sibuk. Coba lagi.";
            default: return "Gagal mengenali suara. Coba lagi.";
        }
    }

    private void startVoiceInput() {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
            return;
        }
        if (speechRecognizer == null) return;
        micButton.setText("⏹  Berhenti");
        speechRecognizer.startListening(speechIntent);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_AUDIO && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startVoiceInput();
        } else if (requestCode == REQ_AUDIO) {
            statusText.setText("Izin mikrofon diperlukan untuk memakai fitur suara.");
        }
    }

    private void handleVoiceCommand(String raw) {
        String command = normalize(raw);
        if (command.isEmpty()) return;

        if (command.equals("hapus semua") || command.equals("hapus seluruh daftar") || command.equals("kosongkan daftar")) {
            clearAll();
            return;
        }
        if (command.equals("bersihkan selesai") || command.equals("hapus yang selesai") || command.equals("hapus selesai")) {
            clearCompleted();
            return;
        }

        String target = afterKeyword(command, "centang", "tandai", "selesai", "sudah");
        if (target != null) {
            markMatching(target);
            return;
        }

        target = afterKeyword(command, "hapus", "buang");
        if (target != null) {
            removeMatching(target);
            return;
        }

        target = afterKeyword(command, "tambah", "buat", "catat", "ingat");
        if (target != null) {
            addTasksFromPhrase(target);
            return;
        }

        if (command.startsWith("buat daftar ")) {
            addTasksFromPhrase(command.substring("buat daftar ".length()));
            return;
        }
        if (command.startsWith("daftar ")) {
            addTasksFromPhrase(command.substring("daftar ".length()));
            return;
        }

        addTasksFromPhrase(command);
    }

    private String afterKeyword(String command, String... keywords) {
        for (String keyword : keywords) {
            if (command.equals(keyword)) return null;
            String prefix = keyword + " ";
            if (command.startsWith(prefix)) return command.substring(prefix.length()).trim();
            String around = " " + keyword + " ";
            int idx = command.indexOf(around);
            if (idx >= 0 && idx < 12) return command.substring(idx + around.length()).trim();
        }
        return null;
    }

    private void addFromText() {
        String input = taskInput.getText().toString().trim();
        if (input.isEmpty()) return;
        addTasksFromPhrase(normalize(input));
        taskInput.setText("");
    }

    private void addTasksFromPhrase(String phrase) {
        List<String> pieces = splitTasks(phrase);
        int added = 0;
        for (String piece : pieces) {
            String clean = cleanTask(piece);
            if (!clean.isEmpty() && !containsExact(clean)) {
                tasks.add(new Task(capitalize(clean), false));
                added++;
            }
        }
        saveTasks();
        refreshTaskList();
        if (added == 0) statusText.setText("Tidak ada tugas baru yang ditambahkan.");
        else statusText.setText(added + " tugas ditambahkan.");
    }

    private List<String> splitTasks(String phrase) {
        String cleaned = phrase.replace(" dan ", ",")
                .replace(" lalu ", ",")
                .replace(" kemudian ", ",")
                .replace(";", ",");
        String[] raw = cleaned.split(",");
        ArrayList<String> out = new ArrayList<>();
        for (String s : raw) if (!s.trim().isEmpty()) out.add(s.trim());
        return out;
    }

    private String cleanTask(String text) {
        String s = text.trim();
        s = s.replaceFirst("^(untuk|tolong|please)\\s+", "");
        s = s.replaceAll("\\s+", " ");
        if (s.length() > 120) s = s.substring(0, 120).trim();
        return s;
    }

    private boolean containsExact(String value) {
        for (Task t : tasks) if (t.text.equalsIgnoreCase(value)) return true;
        return false;
    }

    private void markMatching(String target) {
        List<String> targets = splitTargets(target);
        int changed = 0;
        for (String wanted : targets) {
            String w = cleanTask(wanted);
            for (Task t : tasks) {
                if (!t.done && matches(t.text, w)) {
                    t.done = true;
                    changed++;
                    break;
                }
            }
        }
        saveTasks();
        refreshTaskList();
        statusText.setText(changed > 0 ? changed + " tugas dicentang." : "Tugas yang dimaksud belum ditemukan.");
    }

    private void removeMatching(String target) {
        List<String> targets = splitTargets(target);
        int removed = 0;
        for (String wanted : targets) {
            String w = cleanTask(wanted);
            for (int i = tasks.size() - 1; i >= 0; i--) {
                if (matches(tasks.get(i).text, w)) {
                    tasks.remove(i);
                    removed++;
                    break;
                }
            }
        }
        saveTasks();
        refreshTaskList();
        statusText.setText(removed > 0 ? removed + " tugas dihapus." : "Tugas yang dimaksud belum ditemukan.");
    }

    private List<String> splitTargets(String target) {
        String cleaned = target.replace(" dan ", ",").replace(" lalu ", ",");
        return Arrays.asList(cleaned.split(","));
    }

    private boolean matches(String existing, String wanted) {
        String e = normalize(existing);
        String w = normalize(wanted);
        return !w.isEmpty() && (e.equals(w) || e.contains(w) || w.contains(e));
    }

    private String normalize(String text) {
        return text.toLowerCase(Locale.ROOT).replaceAll("[!?]", "").replaceAll("\\s+", " ").trim();
    }

    private String capitalize(String text) {
        if (text.isEmpty()) return text;
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    private void refreshTaskList() {
        taskContainer.removeAllViews();
        int doneCount = 0;
        for (int i = 0; i < tasks.size(); i++) {
            Task task = tasks.get(i);
            if (task.done) doneCount++;

            CheckBox box = new CheckBox(this);
            box.setText(task.text);
            box.setTextSize(17);
            box.setPadding(8, 18, 8, 18);
            box.setGravity(Gravity.CENTER_VERTICAL);
            box.setChecked(task.done);
            final int index = i;
            box.setOnCheckedChangeListener((buttonView, isChecked) -> {
                tasks.get(index).done = isChecked;
                saveTasks();
                updateProgress();
            });
            taskContainer.addView(box, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
        }
        if (tasks.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("Belum ada catatan.\nTekan mikrofon lalu ucapkan: \"Beli beras, beli minyak, beli telur\".");
            empty.setTextSize(16);
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(24, 60, 24, 60);
            taskContainer.addView(empty);
        }
        progressText.setText(doneCount + " / " + tasks.size() + " selesai");
    }

    private void updateProgress() {
        int done = 0;
        for (Task t : tasks) if (t.done) done++;
        progressText.setText(done + " / " + tasks.size() + " selesai");
    }

    private void clearCompleted() {
        for (int i = tasks.size() - 1; i >= 0; i--) if (tasks.get(i).done) tasks.remove(i);
        saveTasks();
        refreshTaskList();
        statusText.setText("Tugas yang selesai sudah dibersihkan.");
    }

    private void clearAll() {
        tasks.clear();
        saveTasks();
        refreshTaskList();
        statusText.setText("Daftar dikosongkan.");
    }

    private void loadTasks() {
        tasks.clear();
        String json = prefs.getString(KEY_ITEMS, "[]");
        try {
            JSONArray array = new JSONArray(json);
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                tasks.add(new Task(obj.optString("text", ""), obj.optBoolean("done", false)));
            }
        } catch (Exception ignored) {
            tasks.clear();
        }
    }

    private void saveTasks() {
        JSONArray array = new JSONArray();
        try {
            for (Task task : tasks) {
                JSONObject obj = new JSONObject();
                obj.put("text", task.text);
                obj.put("done", task.done);
                array.put(obj);
            }
            prefs.edit().putString(KEY_ITEMS, array.toString()).apply();
        } catch (Exception ignored) { }
    }

    @Override
    protected void onDestroy() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        super.onDestroy();
    }
}
