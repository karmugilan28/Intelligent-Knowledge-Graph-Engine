import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'http://localhost:5000';

const runIntegrationTest = async () => {
  console.log('=== STARTING END-TO-END BACKEND INTEGRATION TEST ===');

  try {
    const testEmail = `test-${Date.now()}@test.com`;
    const testPassword = 'password123';

    // 1. Register a test user
    console.log(`\nStep 1: Registering user: ${testEmail}`);
    const regRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student Test',
        email: testEmail,
        password: testPassword,
      }),
    });
    const regJson = await regRes.json();
    if (!regJson.success) {
      throw new Error(`Registration failed: ${regJson.message}`);
    }

    const { token } = regJson.data;
    console.log('User registered and token received successfully.');

    // 2. Upload PDF
    console.log('\nStep 2: Uploading test_custom_course.pdf...');
    const pdfPath = 'c:/Users/BHUVANESH D/OneDrive/Desktop/learning_path/test_custom_course.pdf';
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Test PDF not found at path: ${pdfPath}`);
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('title', 'Web Development Foundations');
    formData.append('file', fileBlob, 'test_custom_course.pdf');

    const uploadRes = await fetch(`${BACKEND_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const uploadJson = await uploadRes.json();
    if (!uploadJson.success) {
      throw new Error(`Upload failed: ${uploadJson.message}`);
    }

    const { document } = uploadJson.data;
    const documentId = document._id;
    console.log(`Document uploaded successfully. ID: ${documentId}`);

    // 3. Poll pipeline processing progress
    console.log('\nStep 3: Polling pipeline stages and progress...');
    let isCompleted = false;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max timeout

    while (!isCompleted && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusRes = await fetch(`${BACKEND_URL}/api/documents/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statusJson = await statusRes.json();
      if (!statusJson.success) {
        throw new Error(`Status fetch failed: ${statusJson.message}`);
      }

      const doc = statusJson.data.document;
      console.log(`[Attempt #${attempts}] Status: ${doc.status} | Stage: ${doc.currentStage} | Progress: ${doc.progress}%`);

      if (doc.status === 'completed') {
        isCompleted = true;
      } else if (doc.status === 'failed') {
        throw new Error(`Pipeline failed: ${doc.errorMessage}`);
      }
    }

    if (!isCompleted) {
      throw new Error('Pipeline timed out.');
    }

    console.log('\n=== PIPELINE SUCCESSFULLY COMPLETED ===');

    // 4. Test concept search
    console.log('\nStep 4: Testing Search API (Fuzzy and Semantic)');
    const searchRes = await fetch(`${BACKEND_URL}/api/search?documentId=${documentId}&query=react&type=fuzzy`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const searchJson = await searchRes.json();
    console.log(`Found ${searchJson.data.results.length} concepts matching "react".`);
    searchJson.data.results.forEach(c => console.log(`- ${c.name}: ${c.category}`));

    // 5. Test Learning Path Generation
    console.log('\nStep 5: Testing Learning Path Roadmap Generator');
    const pathRes = await fetch(`${BACKEND_URL}/api/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentId,
        targetConcept: 'React.js',
      }),
    });
    const pathJson = await pathRes.json();
    console.log(`Learning Path Steps for "React.js":`);
    pathJson.data.path.forEach((step, idx) => {
      console.log(`Step ${idx + 1}: ${step.concept} (${step.estimatedTime})`);
    });

    // 6. Test RAG Q&A Chat
    console.log('\nStep 6: Testing RAG Q&A Chat Assistant');
    const chatRes = await fetch(`${BACKEND_URL}/api/chat/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: 'What is React and how does it optimize rendering?',
      }),
    });
    const chatJson = await chatRes.json();
    console.log('\nAnswer:');
    console.log(chatJson.data.answer);

    console.log('\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error.message);
    process.exit(1);
  }
};

runIntegrationTest();
