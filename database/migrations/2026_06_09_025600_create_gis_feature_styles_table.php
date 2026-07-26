<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gis_feature_styles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gis_layer_id')->constrained('gis_layers')->onDelete('cascade');
            $table->string('feature_id'); // e.g. "batas_wilayah.1"
            $table->string('feature_name')->nullable(); // e.g. "Kecamatan Rappocini"
            $table->string('color', 7); // Hex color: e.g. "#FF0000"
            $table->timestamps();

            // Unique combination: a layer cannot have duplicate style entries for the same feature ID
            $table->unique(['gis_layer_id', 'feature_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gis_feature_styles');
    }
};
