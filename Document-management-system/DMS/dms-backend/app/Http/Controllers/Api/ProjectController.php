<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Support\ProjectFileStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    private const NOTIFICATION_ROLES = ['Admin', 'CEO', 'Project Manager', 'Simple User'];

    public function index(Request $request): JsonResponse
    {
        $query = Project::query()->latest('id');

        if ($search = trim((string) $request->string('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sr_no', 'like', "%{$search}%")
                    ->orWhere('client', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $perPage = (int) $request->integer('per_page', 100);
        $perPage = max(1, min($perPage, 200));

        $projects = $query->paginate($perPage)->appends($request->query());

        return response()->json([
            'data' => $projects->getCollection()
                ->map(fn (Project $project) => $this->projectPayload($project))
                ->values(),
            'meta' => [
                'currentPage' => $projects->currentPage(),
                'lastPage' => $projects->lastPage(),
                'perPage' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function summary(): JsonResponse
    {
        $baseQuery = Project::query();

        return response()->json([
            'data' => [
                'total' => (clone $baseQuery)->count(),
                'inProgress' => (clone $baseQuery)->where('status', 'In Progress')->count(),
                'win' => (clone $baseQuery)->where('status', 'Win')->count(),
                'lose' => (clone $baseQuery)->where('status', 'Lose')->count(),
                'withFiles' => (clone $baseQuery)->whereNotNull('file')->count(),
                'withoutFiles' => (clone $baseQuery)->whereNull('file')->count(),
            ],
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('file')) {
            $data['file'] = $this->storeFile($request->file('file'));
        }

        $project = Project::create([
            'created_by' => $request->user()?->id,
            'name' => $data['name'],
            'sr_no' => $data['srNo'],
            'client' => $data['client'],
            'description' => $data['description'] ?? null,
            'submission_time' => $data['submissionTime'] ?? null,
            'status' => $data['status'] ?? 'In Progress',
            'team_size' => $data['teamSize'] ?? null,
            'file' => $data['file'] ?? null,
        ]);

        $this->sendProjectNotification(
            $request,
            'Project Created',
            sprintf('%s created project "%s".', $this->actorRole($request), $project->name),
        );

        return response()->json(['data' => $this->projectPayload($project->fresh())], 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json(['data' => $this->projectPayload($project)]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $data = $request->validated();

        if ($request->boolean('removeFile') && $project->file) {
            $this->fileStorage()->delete($project->file);
            $project->file = null;
        }

        if ($request->hasFile('file')) {
            if ($project->file) {
                $this->fileStorage()->delete($project->file);
            }

            $project->file = $this->storeFile($request->file('file'));
        }

        $project->fill([
            'name' => $data['name'] ?? $project->name,
            'sr_no' => $data['srNo'] ?? $project->sr_no,
            'client' => $data['client'] ?? $project->client,
            'description' => array_key_exists('description', $data) ? ($data['description'] ?? null) : $project->description,
            'submission_time' => array_key_exists('submissionTime', $data) ? ($data['submissionTime'] ?? null) : $project->submission_time,
            'status' => array_key_exists('status', $data) ? ($data['status'] ?? 'In Progress') : $project->status,
            'team_size' => array_key_exists('teamSize', $data) ? ($data['teamSize'] ?? null) : $project->team_size,
        ]);

        $project->save();

        $this->sendProjectNotification(
            $request,
            'Project Updated',
            sprintf('%s updated project "%s".', $this->actorRole($request), $project->name),
        );

        return response()->json(['data' => $this->projectPayload($project->fresh())]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $projectName = $project->name;

        if ($project->file) {
            $this->fileStorage()->delete($project->file);
        }

        $project->delete();

        $this->sendProjectNotification(
            $request,
            'Project Deleted',
            sprintf('%s deleted project "%s".', $this->actorRole($request), $projectName),
        );

        return response()->json(['ok' => true]);
    }

    public function download(Project $project)
    {
        if (!$project->file || !$this->fileStorage()->exists($project->file)) {
            return response()->json(['message' => 'Project file not found.'], 404);
        }

        $downloadName = $this->downloadName($project);

        return $this->fileStorage()->downloadResponse($project->file, $downloadName);
    }

    private function projectPayload(Project $project): array
    {
        $fileExists = $this->fileStorage()->exists($project->file);

        return [
            'id' => $project->id,
            'name' => $project->name,
            'srNo' => $project->sr_no,
            'client' => $project->client,
            'description' => $project->description,
            'submissionTime' => optional($project->submission_time)?->toISOString(),
            'status' => $project->status,
            'teamSize' => $project->team_size,
            'createdBy' => $project->created_by,
            'file' => $project->file,
            'fileName' => $project->file ? basename($project->file) : null,
            'hasFile' => $fileExists,
            'fileUrl' => ($project->file && $fileExists) ? $this->fileStorage()->publicUrl($project->file) : null,
            'createdAt' => optional($project->created_at)?->toISOString(),
            'updatedAt' => optional($project->updated_at)?->toISOString(),
        ];
    }

    private function storeFile(\Illuminate\Http\UploadedFile $file): string
    {
        return $this->fileStorage()->storeUploadedFile($file);
    }

    private function downloadName(Project $project): string
    {
        $extension = pathinfo((string) $project->file, PATHINFO_EXTENSION);
        $base = Str::slug($project->name ?: 'project-file') ?: 'project-file';

        return $base.($extension ? '.'.$extension : '');
    }

    private function fileStorage(): ProjectFileStorage
    {
        return app(ProjectFileStorage::class);
    }

    private function sendProjectNotification(Request $request, string $title, string $message): void
    {
        notify($title, $message, self::NOTIFICATION_ROLES);
    }

    private function actorRole(Request $request): string
    {
        return notification_role_display($request->user()?->role) ?? 'User';
    }
}
