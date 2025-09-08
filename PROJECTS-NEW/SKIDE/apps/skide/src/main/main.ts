import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { KodiiOrchestrator } from '@kodii/core';
import { ChatThreadsService } from '@skide/chat-threads';
import { ProjectBrain } from '@skide/project-brain';

class SKIDEMain {
  private mainWindow: BrowserWindow | null = null;
  private kodii: KodiiOrchestrator;
  private chatService: ChatThreadsService;
  private projectBrain: ProjectBrain;

  constructor() {
    this.kodii = new KodiiOrchestrator({
      mode: 'local',
      dataDir: join(app.getPath('userData'), 'kodii')
    });
    
    this.chatService = new ChatThreadsService({
      dbPath: join(app.getPath('userData'), 'threads.db')
    });
    
    this.projectBrain = new ProjectBrain({
      dbPath: join(app.getPath('userData'), 'brain.db')
    });
  }

  async initialize() {
    await this.kodii.initialize();
    await this.chatService.initialize();
    await this.projectBrain.initialize();
    
    this.setupIPCHandlers();
    this.createMainWindow();
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/preload.js')
      },
      titleBarStyle: 'hiddenInset',
      show: false
    });

    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev 
      ? 'http://localhost:5174' 
      : `file://${join(__dirname, '../renderer/index.html')}`;

    this.mainWindow.loadURL(url);
    
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    if (isDev) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  private setupIPCHandlers() {
    // Chat thread operations
    ipcMain.handle('threads:list', () => this.chatService.listThreads());
    ipcMain.handle('threads:create', (_, params) => this.chatService.createThread(params));
    ipcMain.handle('threads:delete', (_, id) => this.chatService.deleteThread(id));
    
    // Kodii operations
    ipcMain.handle('kodii:chat', async (_, { threadId, message, context }) => {
      return this.kodii.processMessage(threadId, message, context);
    });
    
    // Project brain operations
    ipcMain.handle('brain:index-file', (_, filePath) => this.projectBrain.indexFile(filePath));
    ipcMain.handle('brain:search', (_, query) => this.projectBrain.search(query));
  }
}

// App lifecycle
app.whenReady().then(async () => {
  const skide = new SKIDEMain();
  await skide.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    new SKIDEMain().initialize();
  }
});
