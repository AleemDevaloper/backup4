<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'srNo' => ['required', 'string', 'max:255'],
            'client' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'submissionTime' => ['nullable', 'date'],
            'status' => ['nullable', 'string', Rule::in(['In Progress', 'Win', 'Lose'])],
            'teamSize' => ['nullable', 'integer', 'min:0'],
            'file' => ['nullable', 'file', 'max:20480'],
        ];
    }
}
