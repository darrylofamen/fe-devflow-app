"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AnswerSchema } from "@/lib/validation";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface AnswerFormProps {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

const AnswerForm = ({ questionId, questionTitle, questionContent }: AnswerFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const session = useSession();

  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startTransition(async () => {
      const result = await createAnswer({
        content: values.content,
        questionId,
      });

      if (result?.success) {
        form.reset();

        toast("Success", {
          description: "Answer posted successfully",
          style: {
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
          },
        });

        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
      } else {
        toast("Error", {
          description: result?.error?.message,
          style: {
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
          },
        });
      }
    });
  };

  const generateAIAnswer = async () => {
    if (session?.status !== "authenticated") {
      return toast("Unauthorized", {
        description: "You need to be logged in to generate an AI answer",
        style: {
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        },
      });
    }

    try {
      setIsAISubmitting(true);

      const { success, data, error } = await api.ai.getAnswer(questionTitle, questionContent);

      if (!success) {
        return toast("Error", {
          description: error?.message,
          style: {
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
          },
        });
      }

      // Clean the AI response to handle problematic markdown elements
      const cleanAIAnswer = (answer: string): string => {
        return (
          answer
            // Remove horizontal rules (thematic breaks) that cause parsing issues
            .replace(/^---$/gm, "")
            .replace(/^___$/gm, "")
            .replace(/^\*\*\*$/gm, "")
            // Replace multiple newlines with single newlines
            .replace(/\n{3,}/g, "\n\n")
            // Trim whitespace
            .trim()
        );
      };

      const formattedAnswer = cleanAIAnswer(data as string);

      if (editorRef.current) {
        try {
          editorRef.current.setMarkdown(formattedAnswer);
          form.setValue("content", formattedAnswer);
          form.trigger("content");
        } catch (editorError) {
          console.error("Editor error:", editorError);
          // If there's still an error with the cleaned content, use a fallback
          const fallbackAnswer = formattedAnswer.replace(/---/g, "--");
          editorRef.current.setMarkdown(fallbackAnswer);
          form.setValue("content", fallbackAnswer);
          form.trigger("content");
        }
      }

      toast("Success", {
        description: "AI answer generated successfully",
        style: {
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
        },
      });
    } catch (error) {
      console.error("AI answer generation error:", error);
      return toast("Error", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        style: {
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        },
      });
    } finally {
      setIsAISubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">Write your answer here</h4>
        <Button
          className="btn light-border-2 text-primary-500 dark:text-primary-500 cursor-pointer gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
          disabled={isAISubmitting}
          onClick={generateAIAnswer}
        >
          {isAISubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Generate AI Answer"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 flex w-full flex-col gap-10">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl>
                  <Editor value={(field.value as string) ?? ""} editorRef={editorRef} fieldChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" className="primary-gradient w-fit cursor-pointer">
              {isPending ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
